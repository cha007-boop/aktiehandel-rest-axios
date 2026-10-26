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
            activeView: 'filter',
            newAktie: {
                name: '',
                amount: null,
                exchangePrice: null,
            },
            isSubmitting: false,
            postMessage: '',
            postError: '',
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
        postAktie() {
            this.isSubmitting = true
            this.postMessage = ''
            this.postError = ''

            axios
                .post(baseURL, this.newAktie)
                .then(() => {
                    this.postMessage = 'Stock added successfully.'
                    this.newAktie = {
                        name: '',
                        amount: null,
                        exchangePrice: null,
                    }
                })
                .catch((error) => {
                    this.postError = error.response?.data?.title
                        || error.response?.data?.message
                        || error.message
                })
                .finally(() => {
                    this.isSubmitting = false
                })
        },
    },
    computed: {
        myComputed() {
            return ''
        },
    },

})