import { Router } from '@vaadin/router';

export function setupRouter(outlet: HTMLElement) {
  const router = new Router(outlet);

  router.setRoutes([
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      component: 'app-home',
    },
    {
      path: '/space/:rootPerspective',
      children: [
        { path: '/official', component: 'app-doc' },
        { path: '/official/:pageId', component: 'app-doc' },
        { path: '/:perspectiveId', component: 'app-doc' },
        { path: '/:perspectiveId/:pageId', component: 'app-doc' },
      ],
    },
  ]);

  return router;
}
