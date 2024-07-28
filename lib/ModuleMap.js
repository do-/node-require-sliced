const {basename} = require ('path')
const ObjectMerger = require ('./ObjectMerger')
const ModuleLoader = require ('./ModuleLoader')

class ModuleMap extends Map {

	constructor (o) {
	
		if (o == null) throw new Error ('Options are not set for ModuleMap')

		{
		
			const t = typeof o
			
			if (t !== 'object') throw new Error ('Object valued option bags required by ModuleMap constructor, not ' + t)

		}
		
		super ()
		
		let loaderOptions = {}

		for (const [k, v] of Object.entries (o)) if (v !== undefined) switch (k) {

			case 'dir':
			case 'ext':
			case 'watch':
				loaderOptions [k] = v
				break

			case 'merger':
				if (!(v instanceof ObjectMerger)) throw new Error ('Only ObjectMerger or its descendant can be used as merger')
				this.merger = v
				break

			default:
				throw new Error ('Unknown ModuleMap option: ' + k)

		}
	
		this.loader = new ModuleLoader (loaderOptions)
		
		if (!('merger' in this)) this.merger = new ObjectMerger ()

	}

	get (k) {
	
		{
		
			const t = typeof k
			
			if (t !== 'string') throw new Error ('Only string keys are allowed by ModuleMap, not ' + t)

		}

		const {loader} = this

		if (this.has (k) && loader.isModified (k)) this.delete (k)

		if (!this.has (k)) for (const v of loader.require (k)) this.set (k, v)

		const v = super.get (k)
		
		this.merger.emit ('complete', v, k)

		return v
	
	}
	
	load () {
	
		for (const [k, v] of this.loader.requireAll ()) this.set (k, v)

		for (const [k, v] of this.entries ()) this.merger.emit ('complete', v, k)

	}
	
	set (k, v) {
		
		if (!this.has (k)) return super.set (k, v)
		
		this.merger.merge (super.get (k), v)
	
	}

}

module.exports = ModuleMap
