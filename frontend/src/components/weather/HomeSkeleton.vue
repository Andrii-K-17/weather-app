<template>
  <div class="skeleton" aria-busy="true">
    <div class="skeleton-hero">
      <q-skeleton type="text" width="38%" height="26px" animation="pulse" />
      <q-skeleton type="text" width="52%" height="96px" animation="pulse" />
      <q-skeleton type="text" width="34%" animation="pulse" />
    </div>
    <q-skeleton
      type="rect"
      height="112px"
      animation="pulse"
      class="skeleton-block"
    />
    <q-skeleton
      type="rect"
      height="240px"
      animation="pulse"
      class="skeleton-block"
    />
    <q-skeleton
      type="rect"
      height="160px"
      animation="pulse"
      class="skeleton-block"
    />
  </div>
</template>

<style scoped lang="scss">
.skeleton-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 28px;
}

.skeleton-block {
  margin-bottom: 14px;
  border-radius: var(--radius-lg);
}
</style>
