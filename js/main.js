const baseURL = 'http://localhost:5138/api/aktiehandels'

const app = Vue.createApp({
    data() {
        return {
            intro: 'Aktiehandel',
            aktieList: [],
            id: null,
            aktieName: null,
            minAmount: null,
            maxAmount: null,
            minExchangePrice: null,
            maxExchangePrice: null,
            sortBy: null,
            sortAscending: true,
        }
    },
    mounted() {
        this.getAll()
    },
    methods: {
        myMethod() {

        },
        getAll() {
            const params = {}
            const filters = {
                id: this.id,
                name: this.aktieName,
                minExchangePrice: this.minExchangePrice,
                maxExchangePrice: this.maxExchangePrice,
                minAmount: this.minAmount,
                maxAmount: this.maxAmount,
            }

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    params[key] = value
                }
            })

            if (this.sortBy) {
                params.sortBy = this.sortBy
                params.sortAscending = this.sortAscending ? 'asc' : 'desc'
            }

            axios
                .get(baseURL, { params })
                .then((response) => {
                    this.aktieList = response.data
                })
                .catch((error) => {
                    console.log(error)
                    this.aktieList = []
                })
        },
        sortByColumn(column) {
            if (this.sortBy === column) {
                this.sortAscending = !this.sortAscending
            } else {
                this.sortBy = column
                this.sortAscending = true
            }
            this.getAll()
        },
    },
    computed: {
        myComputed() {
            return ''
        },
    },

})