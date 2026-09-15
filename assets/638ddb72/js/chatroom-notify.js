(() => {
  const root = document.querySelector('[data-nebula-chatroom][data-c76-state="notification_destination"]');
  const notify = root?.querySelector('[data-notify-action="open-destination"]');
  if (!root || !notify) return;

  notify.addEventListener('click', () => {
    root.dataset.lastAction = 'notification-destination-open-required';
    root.dispatchEvent(new CustomEvent('nebula:notification-destination-open-required', {
      bubbles: true,
      detail: {
        routeOwner: '/nebula-account/chatroom/notify',
        state: 'notification_destination',
        targetState: 'notification_channel_selection',
        transitionEvidence: 'pm_inference_no_figma_prototype_edge',
        preferenceSaved: false,
        notificationSent: false,
        deliveryClaimed: false,
        sessionMutation: false,
        balanceMutation: false,
        messageMutation: false,
      },
    }));
  });
})();
