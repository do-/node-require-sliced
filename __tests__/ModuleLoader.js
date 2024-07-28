const {ModuleLoader} = require ('..')
const Path = require ('path')
const fs = require ('fs')

const r = () => ['root1', 'root2'].map (i => Path.join (__dirname, 'data', i))

const dir = {
	root: r (),
}

const x = Path.join (__dirname, 'data', 'root1', 'xx')
const xu = Path.join (x, 'tb_houses.js')

function x_off () {
	if (fs.existsSync (xu)) fs.unlinkSync (xu)
	if (fs.existsSync (x)) fs.rmdirSync (x)
}

function x_on (id) {
	if (!fs.existsSync (x)) fs.mkdirSync (x)
	fs.writeFileSync (xu, `module.exports = {id: ${id}}`)
}

test ('constructor', () => {

	expect (() => {
		new ModuleLoader ()
	}).toThrow ()

	expect (() => {
		new ModuleLoader ({})
	}).toThrow ()

	expect (() => {
		new ModuleLoader (1)
	}).toThrow ()

	expect (() => {
		new ModuleLoader ({
			id: 1
		})
	}).toThrow ()

	expect (() => {
		new ModuleLoader ({
			dir,
			ext: 0,
		})
	}).toThrow ()

	expect (() => {
		new ModuleLoader ({
			dir,
			watch: 0,
		})
	}).toThrow ()

	expect (
		new ModuleLoader ({
			dir,
		})
	).toBeInstanceOf (ModuleLoader)

	expect (
		new ModuleLoader ({
			dir,
			ext: '.txt',
		})
	).toBeInstanceOf (ModuleLoader)

	expect (
		new ModuleLoader ({
			dir,
			ext: undefined,
		})
	).toBeInstanceOf (ModuleLoader)

})

test ('!watch', () => {

	x_off ()

	const m = new ModuleLoader ({dir, watch: false})

	expect (m.isModified ('tb_houses')).toBe (false)	
	
	const h = [...m.require ('tb_houses')]
	const a = [...m.requireAll ()]

	expect (a).toStrictEqual (h.map (o => (['tb_houses', o])))
	
	expect (() => {
		const a = [...m.require ('vw_houses')]
	}).toThrow ()

})

test ('watch', () => {

	x_off ()

	const m = new ModuleLoader ({dir, watch: true})
	
	expect (m.isModified ('tb_houses')).toBe (true)	
	{
		const a = [...m.require ('tb_houses')]
		expect (a).toHaveLength (8)
	}

	for (const id of [1, 2]) {

		x_on (id)

		expect (m.isModified ('tb_houses')).toBe (true)
		jest.resetModules ()
		{
			const a = [...m.require ('tb_houses')]
			expect (a).toHaveLength (9)
			expect (a.find (i => i.id).id).toBe (id)
		}
		expect (m.isModified ('tb_houses')).toBe (false)

		x_off ()

	}

	expect (m.isModified ('tb_houses')).toBe (true)	
	{
		const a = [...m.require ('tb_houses')]
		expect (a).toHaveLength (8)
	}
	expect (m.isModified ('tb_houses')).toBe (false)

})
