module.exports = {

    select_users: async function () {
    
		return [{id: 1}]
        
    },

    do_wait_for_users: async function () {

      const timeout = this.rq.id

      return new Promise (ok => setTimeout (ok, timeout))

    },

    get_item_of_users: async function () {

    	const {rq: {id}} = this
    	
    	if (isNaN (id)) throw Error ('Invalid id')

		return {id}

    },
    
}