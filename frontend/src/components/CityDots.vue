<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ count: number; active: number; temporaryFirst?: boolean }>();
const emit = defineEmits<{ select: [index: number] }>();

const { t } = useI18n();
</script>

<template>
  <nav class="dots">
    <button
      v-for="i in count"
      :key="i"
      type="button"
      class="dot"
      :class="{ 'dot--active': i - 1 === active, 'dot--temp': temporaryFirst && i === 1 }"
      :aria-label="t('favorites.dot', { n: i, total: count })"
      :aria-current="i - 1 === active ? 'true' : undefined"
      @click="emit('select', i - 1)"
    />
  </nav>
</template>

<style scoped lang="scss">
.dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px 0 0;
}

.dot {
  position: relative;
  width: 7px;
  height: 7px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: var(--text-faint);
  opacity: 0.7;
  cursor: pointer;

  transition:
    width 0.3s ease,
    opacity 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -10px -4px;
  }

  &--active {
    width: 17px;
    opacity: 1;
    background: var(--text-muted);
  }

  &--temp {
    background: transparent;
    box-shadow: inset 0 0 0 1.5px var(--text-faint);

    &.dot--active {
      box-shadow: inset 0 0 0 1.5px var(--text-muted);
    }
  }
}
</style>
