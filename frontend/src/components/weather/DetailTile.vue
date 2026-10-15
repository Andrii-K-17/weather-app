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
      <q-icon
        :name="icon"
        size="18px"
        aria-hidden="true"
      />
      <span class="wx-label">{{ label }}</span>
    </div>

    <div class="detail-tile-value">
      {{ value }}
      <div
        v-if="$slots.suffix"
        class="h-arrow"
      >
        <div class="arrow-label">W</div>
        <div class="v-arrow">
          <div class="arrow-label">N</div>
          <slot name="suffix" />
          <div class="arrow-label">S</div>
        </div>
        <div class="arrow-label">E</div>
      </div>
    </div>

    <div
      v-if="meter !== undefined"
      class="detail-tile-meter"
    >
      <span
        class="detail-tile-meter-fill"
        :style="{ width: `${Math.min(Math.max(meter, 0), 100)}%` }"
      />
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

.arrow-label {
  font-size: 10px;
  color: var(--text);
}

.v-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
}

.h-arrow {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 3px;
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
  box-shadow: 0px 0px 1px rgb(123, 130, 134);
}

.detail-tile-meter-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: var(--bar-from);
  transition: width 0.6s ease;
}
</style>
