export default {
  inserted: function (el, binding, vnode) {
    el.childNodes[0].childNodes[0].style.filter = 'blur(' + binding.value + 'em)'
  }
}
