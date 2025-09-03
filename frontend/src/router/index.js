import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

// STATIC COMPONENTS

import * as StaticComponents from './staticLazyLoad'

// VIEWS

const Home = resolve => {
  require.ensure(['@/views/Home.vue'], () => {
    resolve(require('@/views/Home.vue'))
  })
}

const Login = resolve => {
  require.ensure(['@/views/Login.vue'], () => {
    resolve(require('@/views/Login.vue'))
  })
}

const Register = resolve => {
  require.ensure(['@/views/Register.vue'], () => {
    resolve(require('@/views/Register.vue'))
  })
}

const Dashboard = resolve => {
  require.ensure(['@/views/Dashboard.vue'], () => {
    resolve(require('@/views/Dashboard.vue'))
  })
}

const Settings = resolve => {
  require.ensure(['@/views/Settings.vue'], () => {
    resolve(require('@/views/Settings.vue'))
  })
}

const Tracks = resolve => {
  require.ensure(['@/views/Tracks.vue'], () => {
    resolve(require('@/views/Tracks.vue'))
  })
}

const Soundkits = resolve => {
  require.ensure(['@/views/Soundkits.vue'], () => {
    resolve(require('@/views/Soundkits.vue'))
  })
}

const TrackPage = resolve => {
  require.ensure(['@/views/TrackPage.vue'], () => {
    resolve(require('@/views/TrackPage.vue'))
  })
}

Vue.use(VueRouter)

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
    meta: {
      title: 'Welcome | Chromatique'
    }
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Login | Chromatique'
    },
    beforeEnter: (to, from, next) => {
      if (store.getters['auth/authenticated']) {
        return next({
          name: 'Dashboard'
        })
      }
      next()
    }
  },
  {
    path: '/Register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'Register | Chromatique'
    },
    beforeEnter: (to, from, next) => {
      if (store.getters['auth/authenticated']) {
        return next({
          name: 'Dashboard'
        })
      }
      next()
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
    meta: {
      title: 'Dashboard | Chromatique'
    },
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/authenticated']) {
        return next({
          name: 'Home'
        })
      }
      next()
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
    meta: {
      title: 'Settings | Chromatique'
    },
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/authenticated']) {
        return next({
          name: 'Home'
        })
      }
      next()
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
    meta: {
      title: 'Tracks | Chromatique'
    },
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/authenticated']) {
        return next({
          name: 'Home'
        })
      }
      next()
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
    meta: {
      title: 'Soundkits | Chromatique'
    },
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/authenticated']) {
        return next({
          name: 'Home'
        })
      }
      next()
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

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
