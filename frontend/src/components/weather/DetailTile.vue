<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: string;
  meter?: number;
}>();
</script>

<template>
  <div class="detail-tile wx-card">
    <div class="detail-tile-head">
      <q-icon :name="icon" size="18px" aria-hidden="true" />
      <span class="wx-label">{{ label }}</span>
    </div>

    <div class="detail-tile-value">
      {{ value }}
      <slot name="suffix" />
    </div>

    <div v-if="meter !== undefined" class="detail-tile-meter">
      <span class="detail-tile-meter-fill" :style="{ width: `${Math.min(Math.max(meter, 0), 100)}%` }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.detail-tile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: var(--radius-md);
}

.detail-tile-head {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
}

.detail-tile-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 24px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.detail-tile-meter {
  height: 4px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--bar-track);
}

.detail-tile-meter-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: var(--bar-from);
  transition: width 0.6s ease;
}
</style>
