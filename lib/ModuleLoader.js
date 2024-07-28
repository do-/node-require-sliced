const {basename} = require ('path')
const fs = require ('fs')
const {DirList} = require ('fs-iterators')

class ModuleLoader {

	constructor (o) {
	
		if (o == null) throw new Error ('Options are not set for ModuleLoader')

		{
		
			const t = typeof o
			
			if (t !== 'object') throw new Error ('Object valued option bags required by ModuleLoader constructor, not ' + t)

		}
		
		for (const [k, v] of Object.entries (o)) if (v !== undefined) switch (k) {

			case 'dir':
				this.dir = new DirList (v)
				break 

			case 'ext':
				if (typeof v !== 'string') throw new Error ('ext must be a string, not ' + v)
				this.ext = v
				break

			case 'watch':
				if (typeof v !== 'boolean') throw new Error ('watch must be a boolean, not ' + v)
				this.watch = v
				break

			default:
				throw new Error ('Unknown ModuleLoader option: ' + k)

		}

		if (!('dir' in this)) throw new Error ('dir must be set')

		if (!('ext' in this)) this.ext = '.js'

		if (!('watch' in this)) this.watch = false
		
		if (this.watch) {
		
			this.mtimes = new Map ()
			
		}
		else {

			this.isModified = () => false
			
		}

	}
	
	isModified (name) {

		const {mtimes} = this; if (!mtimes.has (name)) return true
		
		const m = mtimes.get (name)

		const {dir, ext} = this, filter = name + ext

		for (const path of dir.files (filter)) {

			if (!m.has (path)) return true

			if (fs.statSync (path).mtime > m.get (path)) return this.delete (name)

		}

		for (const path of m.keys ())

			if (!fs.existsSync (path)) return this.delete (name)

		return false

	}
	
	delete (name) {

		const {mtimes} = this

		for (const path of mtimes.get (name).keys ()) 
		
			delete require.cache [require.resolve (path)]

		mtimes.delete (name)
		
		return true

	}
	
	add (name, path) {

		const {mtimes} = this

		if (!mtimes.has (name)) mtimes.set (name, new Map ())

		mtimes.get (name).set (path, fs.statSync (path).mtime)

	}

	* require (name) {

		const {dir, ext, watch} = this, filter = name + ext

		let found = false; for (const path of dir.files (filter)) {

			if (watch) this.add (name, path)

			found = true
			
			yield require (path)

		}

		if (!found) throw new Error (filter + ' not found in none of ' + [...dir])

	}

	* requireAll () {

		const {dir, ext} = this, end = - ext.length
		
		for (const path of dir.files (s => s.slice (end) === ext))

			yield [basename (path, ext), require (path)]

	}

}

module.exports = ModuleLoader