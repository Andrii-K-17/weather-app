<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: string;
  meter?: number;
}>();
</script>

<template>
  <div class="tile wx-card">
    <div class="tile__head">
      <q-icon :name="icon" size="18px" aria-hidden="true" />
      <span class="wx-label">{{ label }}</span>
    </div>

    <div class="tile__value">
      {{ value }}
      <slot name="suffix" />
    </div>

    <div v-if="meter !== undefined" class="tile__meter">
      <span :style="{ width: `${Math.min(Math.max(meter, 0), 100)}%` }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.tile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: var(--radius-md);
}

.tile__head {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
}

.tile__value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 24px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.tile__meter {
  height: 4px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--bar-track);

  span {
    display: block;
    height: 100%;
    border-radius: 2px;
    background: var(--bar-from);
    transition: width 0.6s ease;
  }
}
</style>
