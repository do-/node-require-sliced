const EventEmitter = require ('events')

const T_ARRAY  = 'array'
const T_OBJECT = 'object'
const T_SCALAR = 'scalar'

class ObjectMerger extends EventEmitter {

	constructor () {
	
		super ()
	
		this.sum = {
		
			[T_ARRAY]: (a, b) => a.concat (b),
			
			[T_OBJECT]: (a, b) => this.merge (a, b),
			
			[T_SCALAR]: (a, b, k) => {

				if (a == b) return a

				throw new Error ('Scalars must be equal while merging: ' + a + ' vs. ' + b + ' (' + k + ')')

			}
		
		}
	
	}

	merge (a, b) {
	
		for (const k in b) 
		
			a [k] = k in a ? this.add (a [k], b [k], k) : b [k]
			
		return a
	
	}
	
	getType (a) {
	
		if (Array.isArray (a)) return T_ARRAY
		
		if (typeof a === 'object') return T_OBJECT
		
		return T_SCALAR
	
	}
	
	add (a, b, k) {
	
		if (a == null) return b
		if (b == null) return a
		
		const ta = this.getType (a), tb = this.getType (b)
		
		if (ta !== tb) throw new Error (`Cannot add ${ta}s to ${tb}s (${k})`)

		return this.sum [ta] (a, b, k)

	}

}

module.exports = ObjectMerger