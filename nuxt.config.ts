// https://nuxt.com/docs/api/configuration/nuxt-config


// https://vue3-google-signin.wavezync.com/guide/#with-nuxt

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: {enabled: true},
    nitro: {
        experimental: {
            database: true
        }
    },
    modules: [
        'nuxt-vue3-google-signin'
    ],
    googleSignIn: {
        clientId: '772807508972-gv0pg89vbvqvvhj64qhhnfjp7ebp7ktj.apps.googleusercontent.com',
    }

})
