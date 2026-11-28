// Follows the ImperfectLab theme.
(function () {
  var KEY = 'imperfectlab.theme.v2'
  var THEMES = ['dark', 'light', 'nemesis', 'nemesis-classic']
  function apply() {
    var t = null
    try { t = localStorage.getItem(KEY) } catch (e) { }
    document.documentElement.dataset.theme = THEMES.indexOf(t) < 0 ? 'dark' : t
  }
  apply()
  addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) apply() })
})()