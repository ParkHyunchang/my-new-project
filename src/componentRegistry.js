// 새 페이지를 추가할 때 여기에 등록하세요
export const componentRegistry = {
  HomeView: () => import('@/views/HomeView.vue'),
  TestView: () => import('@/views/TestView.vue'),
}
