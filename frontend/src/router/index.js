// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// STATIC COMPONENTS
import * as StaticComponents from './staticLazyLoad'

// VIEWS (Lazy load)
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
    meta: { title: 'Welcome | Chromatique' }
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    meta: { title: 'Login | Chromatique' },
    beforeEnter: (to, from, next) => {
      if (store.getters['auth/authenticated']) {
        next({ name: 'Dashboard' })
      } else next()
    }
  },
  {
    path: '/Register',
    name: 'Register',
    component: Register,
    meta: { title: 'Register | Chromatique' },
    beforeEnter: (to, from, next) => {
      if (store.getters['auth/authenticated']) {
        next({ name: 'Dashboard' })
      } else next()
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
    meta: { title: 'Dashboard | Chromatique' },
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/authenticated']) {
        next({ name: 'Home' })
      } else next()
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
    meta: { title: 'Settings | Chromatique' },
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/authenticated']) {
        next({ name: 'Home' })
      } else next()
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
    meta: { title: 'Tracks | Chromatique' },
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/authenticated']) {
        next({ name: 'Home' })
      } else next()
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
    meta: { title: 'Soundkits | Chromatique' },
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/authenticated']) {
        next({ name: 'Home' })
      } else next()
    }
  },
  // Track Page
  {
    path: '/:userSlug/:trackSlug',
    name: 'TrackPage',
    components: {
      default: TrackPage,
      Navigation: StaticComponents.Navigation,
      TopNav: StaticComponents.TopNav,
      SystemBar: StaticComponents.SystemBar,
      BottomPlayer: StaticComponents.BottomPlayer
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
