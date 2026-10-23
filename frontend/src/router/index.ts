// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as StaticComponents from './staticLazyLoad'
import { LEGAL_DOCS, findLegalDoc } from '@/constants/legal'

const APP_NAME = import.meta.env.VITE_APPLICATION_NAME || 'CHROMATIK'

// VIEWS
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Settings = () => import('@/views/Settings.vue')
const Tracks = () => import('@/views/Tracks.vue')
const Soundkits = () => import('@/views/Soundkits.vue')
const TrackPage = () => import('@/views/TrackPage.vue')
const Profile = () => import('@/views/Profile.vue')
const Support = () => import('@/views/Support.vue')
const LegalPage = () => import('@/views/LegalPage.vue')
const Explore = () => import('@/views/Explore.vue')
const Search = () => import('@/views/Search.vue')

const shellComponents = (view: any) => ({
  default: view,
  Navigation: StaticComponents.Navigation,
  TopNav: StaticComponents.TopNav,
  SystemBar: StaticComponents.SystemBar,
  BottomPlayer: StaticComponents.BottomPlayer,
  Footer: StaticComponents.Footer
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    components: shellComponents(Home),
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
    components: shellComponents(Dashboard),
    meta: { title: `Dashboard | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.authenticated) return { name: 'Home' }
    }
  },
  {
    path: '/Settings',
    name: 'Settings',
    components: shellComponents(Settings),
    meta: { title: `Settings | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.authenticated) return { name: 'Home' }
    }
  },
  {
    path: '/Tracks',
    name: 'Tracks',
    components: shellComponents(Tracks),
    meta: { title: `Tracks | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.authenticated) return { name: 'Home' }
    }
  },
  {
    path: '/Soundkits',
    name: 'Soundkits',
    components: shellComponents(Soundkits),
    meta: { title: `Soundkits | ${APP_NAME}` },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.authenticated) return { name: 'Home' }
    }
  },
  {
    path: '/explore/:tab(tracks|producers|soundkits)?',
    name: 'Explore',
    components: shellComponents(Explore),
    beforeEnter: (to) => {
      if (!to.params.tab) {
        const queryTab = to.query.tab as string | undefined
        const targetTab = queryTab && ['tracks', 'producers', 'soundkits'].includes(queryTab) ? queryTab : 'tracks'
        const nextQuery = { ...to.query }
        delete nextQuery.tab
        return { name: 'Explore', params: { tab: targetTab }, query: nextQuery, replace: true }
      }
    },
    meta: {
      dynamicTitle: true,
      title: (to: any) => {
        const tab = (to.params.tab as string) || 'tracks'
        const tabTitle = tab.charAt(0).toUpperCase() + tab.slice(1)
        return `${tabTitle} | Explore | ${APP_NAME}`
      }
    }
  },
  {
    path: '/search',
    name: 'Search',
    components: shellComponents(Search),
    meta: {
      dynamicTitle: true,
      title: `Search | ${APP_NAME}`,
      robots: 'noindex, follow'
    }
  },
  {
    path: '/support',
    name: 'Support',
    components: shellComponents(Support),
    meta: { title: `Support | ${APP_NAME}` }
  },
  {
    path: '/legal',
    redirect: { name: 'Legal', params: { doc: LEGAL_DOCS[0].slug } }
  },
  {
    path: '/legal/:doc',
    name: 'Legal',
    components: shellComponents(LegalPage),
    meta: { title: `Legal | ${APP_NAME}` },
    beforeEnter: (to) => {
      if (!findLegalDoc(to.params.doc as string)) {
        return { name: 'Legal', params: { doc: LEGAL_DOCS[0].slug } }
      }
    }
  },
  {
    path: '/:userSlug',
    name: 'Profile',
    components: shellComponents(Profile),
    meta: {
      dynamicTitle: true,
      title: `Profile | ${APP_NAME}`
    }
  },
  {
    path: '/:userSlug/:trackSlug',
    name: 'TrackPage',
    components: shellComponents(TrackPage),
    meta: {
      dynamicTitle: true,
      title: `Track | ${APP_NAME}`
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  if (to.meta?.title) {
    const title = typeof to.meta.title === 'function' ? to.meta.title(to) : (to.meta.title as string)
    if (title) document.title = title
  }

  // Manage robots meta tag (e.g. for Search page)
  let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (to.meta?.robots) {
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.name = 'robots'
      document.head.appendChild(robotsMeta)
    }
    robotsMeta.content = to.meta.robots as string
  } else if (robotsMeta) {
    robotsMeta.remove()
  }
})

export default router
