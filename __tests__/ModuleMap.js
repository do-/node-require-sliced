const {ModuleMap} = require ('..'), {MODULE_NAME} = ModuleMap
const {ObjectMerger} = require ('subclassable-object-merger')
const Path = require ('path')
const util = require ('util')

const r = () => ['root1', 'root2'].map (i => Path.join (__dirname, 'data', i))

const dir = {
	root: r (),
	filter: (s, a) => a.at (-2) === 'oltp'
}

class MyObjectMerger extends ObjectMerger {
	merge () {
		// do nothing
	}
}

test ('constructor', () => {

	expect (() => {
		new ModuleMap ()
	}).toThrow ()

	expect (() => {
		new ModuleMap ({})
	}).toThrow ()

	expect (() => {
		new ModuleMap (1)
	}).toThrow ()

	expect (() => {
		new ModuleMap ({
			id: 1
		})
	}).toThrow ()

	expect (() => {
		new ModuleMap ({
			merger: null
		})
	}).toThrow ()

	expect (
		new ModuleMap ({
			dir,
			merger: new ObjectMerger ()
		})
	).toBeInstanceOf (ModuleMap)

	expect (
		new ModuleMap ({
			dir,
			merger: new MyObjectMerger ()
		})
	).toBeInstanceOf (ModuleMap)

	expect (() => {
		new ModuleMap ({
			dir,
			merger: new ModuleMap ()
		})
	}).toThrow ()

	expect (() => {
		new ModuleMap ({
			dir,
			ext: 0,
		})
	}).toThrow ()

})

test ('get', () => {

	const g = (k, ext) => new ModuleMap ({dir, ext}).get (k)
	
	expect (g ('tb_houses')).toStrictEqual ({
		[MODULE_NAME]: 'tb_houses',
		columns: {
			root1_oltp: 1,
			root1_crm_oltp: 1,
			root1_hr_oltp: 1,
			root2_hr_oltp: 1
		}
	})

	expect (() => g ('tb_houses', '.txt')).toThrow ()
	expect (() => g ('vw_houses')).toThrow ()
	expect (() => g (0)).toThrow ()

})

test ('load', () => {

	const m = new ModuleMap ({dir})
	
	expect (m.size).toBe (0)
	
	for (const i of [0, 1]) {
	
		m.load ()
		
		expect ([...m.keys ()]).toStrictEqual (['tb_houses'])
		
		expect ([...m.values ()]).toStrictEqual ([{
			[MODULE_NAME]: 'tb_houses',
			columns: {
				root1_oltp: 1,
				root1_crm_oltp: 1,
				root1_hr_oltp: 1,
				root2_hr_oltp: 1
			}
		}])
	
	}

})

test ('load complete', () => {

	const m = new ModuleMap ({dir})
			
	m.load ()

	expect ([...m.values ()]).toStrictEqual ([{
		[MODULE_NAME]: 'tb_houses',
		columns: {
			root1_oltp: 1,
			root1_crm_oltp: 1,
			root1_hr_oltp: 1,
			root2_hr_oltp: 1
		}
	}])

	m.merger.on ('complete', (o, name) => o.name = name)

	m.load ()

	expect ([...m.values ()]).toStrictEqual ([{
		[MODULE_NAME]: 'tb_houses',
		name: 'tb_houses',
		columns: {
			root1_oltp: 1,
			root1_crm_oltp: 1,
			root1_hr_oltp: 1,
			root2_hr_oltp: 1
		}
	}])

})

test ('get complete', () => {

	const m = new ModuleMap ({dir, watch: true})
			
	m.merger.on ('complete', (o, name) => o.name = name)
	
	const name = 'tb_houses'

	expect (m.get (name)).toStrictEqual ({
		[MODULE_NAME]: 'tb_houses',
		name,
		columns: {
			root1_oltp: 1,
			root1_crm_oltp: 1,
			root1_hr_oltp: 1,
			root2_hr_oltp: 1
		}
	})

	expect (m.get (name)).toStrictEqual ({
		[MODULE_NAME]: 'tb_houses',
		name,
		columns: {
			root1_oltp: 1,
			root1_crm_oltp: 1,
			root1_hr_oltp: 1,
			root2_hr_oltp: 1
		}
	})
	
	m.loader.mtimes.clear ()

	expect (m.get (name)).toStrictEqual ({
		[MODULE_NAME]: 'tb_houses',
		name,
		columns: {
			root1_oltp: 1,
			root1_crm_oltp: 1,
			root1_hr_oltp: 1,
			root2_hr_oltp: 1
		}
	})

})

test ('getMethod', () => {

	const m = new ModuleMap ({dir: {root: Path.join (__dirname, 'data', 'root3')}})

	expect (() => m.getMethod ('userz', 'select_users')).toThrow (ModuleMap.ModuleNotFoundError)
	expect (() => m.getMethod ('users', 'select_userz')).toThrow (ModuleMap.MethodNotFoundError)
	expect (() => m.getMethod ('users', 'label')).toThrow (ModuleMap.NotAMethodError)

	expect (m.getMethod ('users', 'select_users') ()).toStrictEqual ([{id: 1}])
	expect (util.types.isAsyncFunction (m.getMethod ('users', 'do_wait_for_users'))).toBe (true)

	for (const i of [1, 2]) {
		const do_wait_for_users = m.getMethod ('users', 'do_wait_for_users')
		expect (do_wait_for_users [ModuleMap.METHOD_NAME]).toBe ('do_wait_for_users')
		expect (do_wait_for_users [ModuleMap.MODULE][ModuleMap.MODULE_NAME]).toBe ('users')
	}

})