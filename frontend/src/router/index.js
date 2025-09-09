// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as StaticComponents from './staticLazyLoad'

const APP_NAME = import.meta.env.VITE_APPLICATION_NAME || 'Chromatique'

// VIEWS
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Settings = () => import('@/views/Settings.vue')
const Tracks = () => import('@/views/Tracks.vue')
const Soundkits = () => import('@/views/Soundkits.vue')
const TrackPage = () => import('@/views/TrackPage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    components: {
      default: Home,
      Navigation: StaticComponents.Navigation,
      TopNav: StaticComponents.TopNav,
      SystemBar: StaticComponents.SystemBar,
      BottomPlayer: StaticComponents.BottomPlayer
    },
    meta: { title: `Welcome | ${APP_NAME}` }
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    meta: { title: `Login | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (auth.authenticated) return { name: 'Dashboard' }
    }
  },
  {
    path: '/Register',
    name: 'Register',
    component: Register,
    meta: { title: `Register | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (auth.authenticated) return { name: 'Dashboard' }
    }
  },
  {
    path: '/Dashboard',
    name: 'Dashboard',
    components: {
      default: Dashboard,
      Navigation: StaticComponents.Navigation,
      TopNav: StaticComponents.TopNav,
      SystemBar: StaticComponents.SystemBar,
      BottomPlayer: StaticComponents.BottomPlayer
    },
    meta: { title: `Dashboard | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.authenticated) return { name: 'Home' }
    }
  },
  {
    path: '/Settings',
    name: 'Settings',
    components: {
      default: Settings,
      Navigation: StaticComponents.Navigation,
      TopNav: StaticComponents.TopNav,
      SystemBar: StaticComponents.SystemBar,
      BottomPlayer: StaticComponents.BottomPlayer
    },
    meta: { title: `Settings | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.authenticated) return { name: 'Home' }
    }
  },
  {
    path: '/Tracks',
    name: 'Tracks',
    components: {
      default: Tracks,
      Navigation: StaticComponents.Navigation,
      TopNav: StaticComponents.TopNav,
      SystemBar: StaticComponents.SystemBar,
      BottomPlayer: StaticComponents.BottomPlayer
    },
    meta: { title: `Tracks | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.authenticated) return { name: 'Home' }
    }
  },
  {
    path: '/Soundkits',
    name: 'Soundkits',
    components: {
      default: Soundkits,
      Navigation: StaticComponents.Navigation,
      TopNav: StaticComponents.TopNav,
      SystemBar: StaticComponents.SystemBar,
      BottomPlayer: StaticComponents.BottomPlayer
    },
    meta: { title: `Soundkits | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.authenticated) return { name: 'Home' }
    }
  },
  {
    path: '/:userSlug/:trackSlug',
    name: 'TrackPage',
    components: {
      default: TrackPage,
      Navigation: StaticComponents.Navigation,
      TopNav: StaticComponents.TopNav,
      SystemBar: StaticComponents.SystemBar,
      BottomPlayer: StaticComponents.BottomPlayer
    },
    meta: { title: `Track | ${APP_NAME}` }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  if (to.meta?.title) document.title = to.meta.title
})

export default router