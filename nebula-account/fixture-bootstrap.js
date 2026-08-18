(() => {
  if (new URLSearchParams(window.location.search).get('fixture') !== '1') return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'yii2/modules/nebulaAccount/resources/css/fixture-host.css';
  document.head.append(style);
  const script = document.createElement('script');
  script.src = 'yii2/modules/nebulaAccount/resources/js/fixture-host.js';
  script.async = false;
  document.body.append(script);
})();
