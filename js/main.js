const baseURL = 'http://localhost:5138/api/aktiehandels/'

const app = Vue.createApp({
    // Initialize the app's data and UI state.
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
            editingId: null,
            editAktie: null,
            isUpdating: false,
            deletingId: null,
            deleteTarget: null,
            updateMessage: '',
            updateError: '',
            deleteError: '',
            newAktie: {
                name: '',
                amount: null,
                exchangePrice: null,
            },
            isSubmitting: false,
            postMessage: '',
            postError: '',
            errorMessage: '',
        }
    },
    // Load stocks when the app starts.
    mounted() {
        this.getAll()
    },
    methods: {
        // Fetch stocks using the current filters and sort order.
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
            // Axios serializes params as URL query parameters.
            axios
                .get(baseURL, { params })
                .then((response) => {
                    this.aktieList = response.data
                    this.errorMessage = ''
                })
                .catch((error) => {
                    console.log(error)
                    this.aktieList = []
                    this.errorMessage = this.getRequestErrorMessage(error)
                })
        },
        // Sort by a column, toggling direction when it is already selected.
        sortByColumn(column) {
            if (this.sortBy === column) {
                this.sortAscending = !this.sortAscending
            } else {
                this.sortBy = column
                this.sortAscending = true
            }
            this.getAll()
        },
        // Create a stock and reset the form after success.
        postAktie() {
            this.isSubmitting = true
            this.postMessage = ''
            this.postError = ''


            axios
                .post(baseURL, this.newAktie)
                .then((response) => {
                    console.log('Post metode kaldt')
                    this.aktieList.push(response.data)
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
                        || error.response?.data
                        || error.message
                })
                .finally(() => {
                    this.isSubmitting = false
                })
        },

        // Copy a stock's values into the inline editor.
        startEdit(aktie) {
            this.editingId = aktie.id
            this.editAktie = {
                name: aktie.name,
                amount: aktie.amount,
                exchangePrice: aktie.exchangePrice,
            }
            this.updateMessage = ''
            this.updateError = ''
        },
        // Discard the inline edits without saving.
        cancelEdit() {
            this.editingId = null
            this.editAktie = null
            this.updateError = ''
        },
        // Validate and save the edited stock with a PUT request.
        putAktie() {
            if (!this.editAktie || this.editingId === null) {
                return
            }

            if (
                !this.editAktie.name.trim()
                || !Number.isFinite(this.editAktie.amount)
                || !Number.isFinite(this.editAktie.exchangePrice)
            ) {
                this.updateError = 'Enter a name, amount, and exchange price.'
                return
            }

            this.isUpdating = true
            this.updateMessage = ''
            this.updateError = ''
            const id = this.editingId
            const updatedAktie = { id, ...this.editAktie }

            axios
                .put(baseURL + id, updatedAktie)
                .then((response) => {
                    // Update the local list with the new values, using the response data if available.
                    const index = this.aktieList.findIndex((aktie) => aktie.id === id)
                    if (index !== -1) {
                        // Merge the existing stock with the updated values, preferring response data if present.
                        // splice(index, 1, newItem) means that at index, remove 1 item and add newItem
                        // The third argument is the new object which we create with the curly brackets
                        // Uses object spread operator (...) to copy an object's properties into the new object
                        // First ...this.aktieList[index] copies current stock properties into a new object
                        // Second ... copies properties from response.data if it's an object, else copies from updatedAktie
                        // If both contain the same property the second is used, and updated fields override old ones, and existing fields are preserved 
                        this.aktieList.splice(index, 1, {
                            ...this.aktieList[index],
                            ...(response.data && typeof response.data === 'object'
                                ? response.data
                                : updatedAktie),
                        })
                        // Using ... this way preserves properties that aren't included in replacement data
                    }
                    this.editingId = null
                    this.editAktie = null
                    this.updateMessage = 'Stock updated successfully.'
                    this.getAll()
                })
                .catch((error) => {
                    this.updateError = this.getRequestErrorMessage(error)
                })
                .finally(() => {
                    this.isUpdating = false
                })
        },
        // Select a stock and show the Bootstrap deletion confirmation.
        openDeleteModal(aktie) {
            this.deleteTarget = aktie
            this.deleteError = ''
            bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show()
        },
        // Delete the confirmed stock with a DELETE request.
        deleteAktie() {
            const aktie = this.deleteTarget
            if (!aktie) {
                return
            }

            this.deletingId = aktie.id
            this.deleteError = ''

            axios
                .delete(baseURL + aktie.id)
                .then(() => {
                    this.aktieList = this.aktieList.filter((item) => item.id !== aktie.id)
                    bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).hide()
                    this.deleteTarget = null
                })
                .catch((error) => {
                    this.deleteError = this.getRequestErrorMessage(error)
                })
                .finally(() => {
                    this.deletingId = null
                })
        },
        // Extract a readable message from an Axios error.
        getRequestErrorMessage(error) {
            const responseData = error.response?.data
            if (typeof responseData === 'string') {
                return responseData
            }
            if (responseData?.title || responseData?.message) {
                return responseData.title || responseData.message
            }
            if (responseData && typeof responseData === 'object') {
                return JSON.stringify(responseData)
            }
            return error.message || 'The request failed.'
        },
    },
    computed: {
        // Placeholder computed property.
        myComputed() {
            return ''
        },
    },

})