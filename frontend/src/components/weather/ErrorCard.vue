<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ApiErrorCode } from '@/api/types';
import { useErrorMessage } from '@/composables/useErrorMessage';

const props = defineProps<{ code: ApiErrorCode | null; retrying?: boolean }>();
const emit = defineEmits<{ retry: []; search: [] }>();

const { t } = useI18n();
const message = useErrorMessage();

const ICONS: Partial<Record<ApiErrorCode, string>> = {
  not_found: 'mdi-map-marker-question-outline',
  network: 'mdi-wifi-off',
  timeout: 'mdi-timer-sand',
  upstream_busy: 'mdi-timer-sand',
  too_many_requests: 'mdi-timer-sand',
};

const icon = computed(() => (props.code && ICONS[props.code]) || 'mdi-cloud-off-outline');
</script>

<template>
  <div
    class="error wx-card"
    role="alert"
  >
    <q-icon
      :name="icon"
      size="44px"
      class="icon"
    />
    <p class="text">{{ message(code) }}</p>

    <q-btn
      v-if="code === 'not_found'"
      flat
      rounded
      no-caps
      :label="t('search.placeholder')"
      @click="emit('search')"
    />
    <q-btn
      v-else
      flat
      rounded
      no-caps
      :label="t('common.retry')"
      :loading="retrying"
      @click="emit('retry')"
    />
  </div>
</template>

<style scoped lang="scss">
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 48px;
  padding: 32px 24px;
  text-align: center;
}

.icon {
  color: var(--text-faint);
}

.text {
  margin: 0;
  color: var(--text-muted);
}
</style>
