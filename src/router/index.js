import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Documents from '../views/Documents.vue'
import DocumentDetail from '../views/DocumentDetail.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/documents',
    name: 'documents',
    component: Documents
  },
  {
    path: '/documents/:id',
    name: 'document-detail',
    component: DocumentDetail
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router 