const baseURL = 'http://localhost:5138/api/aktiehandels'

const app = Vue.createApp({
    data() {
        return {
            intro: 'Aktiehandel',
            aktieList: this.getAll(),
        }
    },
    methods: {
        myMethod() {

        },
        getAll() {
            console.log('All data');
            axios
                .get(baseURL)
                .then((response) => {
                    this.aktieList = response.data
                })
                .catch((error) => {
                    console.log(error)
                })
        },
    },
    computed: {
        myComputed() {
            return ''
        },
    },

})