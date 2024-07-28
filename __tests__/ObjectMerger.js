const om = new (require ('..').ObjectMerger) ()

const f1 = () => ({
	name: 'users',
	label: 'System users',
	columns: {
		id: {TYPE: 'int'},
	},
	data: [
		{id: 1, label: 'admin'}
	],
	triggers: null,
})

const f2 = () => ({
	name: 'users',
	label: undefined,
	columns: {
		id: {AUTO_INCREMENT: true},
		label: {TYPE: 'text'},
	},
	pk: 'id',
	data: [
		{id: 2, label: 'employee'}
	],
	triggers: {before_insert: 'RETURN;'},
})

test ('productive merge', () => {

	let t1 = f1 (), t2 = f2 ()

	expect (om.merge (t1, t2)).toStrictEqual ({
		name: 'users',
		label: 'System users',
		pk: 'id',
		columns: {
			id:    {TYPE: 'int', AUTO_INCREMENT: true},
			label: {TYPE: 'text'},
		},
		data: [
			{id: 1, label: 'admin'},
			{id: 2, label: 'employee'}
		],
		triggers: {before_insert: 'RETURN;'},
	})

})

test ('array-array 1', () => {

	let t1 = f1 (), t2 = f2 ()
	
	t1.data = {}

	expect (() => om.merge (t1, t2)).toThrow ()

})

test ('array-array 2', () => {

	let t1 = f1 (), t2 = f2 ()
	
	t2.data = {}
	
	expect (() => om.merge (t1, t2)).toThrow ()

})

test ('object-object 1', () => {

	let t1 = f1 (), t2 = f2 ()
	
	t1.columns = 0

	expect (() => om.merge (t1, t2)).toThrow ()

})

test ('object-object 2', () => {

	let t1 = f1 (), t2 = f2 ()
	
	t2.columns = 0

	expect (() => om.merge (t1, t2)).toThrow ()

})

test ('scalar-scalar 1', () => {

	let t1 = f1 (), t2 = f2 ()
	
	t1.name = 0

	expect (() => om.merge (t1, t2)).toThrow ()

})

test ('scalar-scalar 2', () => {

	let t1 = f1 (), t2 = f2 ()
	
	t1.name = 0

	expect (() => om.merge (t1, t2)).toThrow ()

})
