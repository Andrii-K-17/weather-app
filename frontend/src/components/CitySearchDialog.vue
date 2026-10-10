<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Place } from '@/api/types';
import { useCitySearch } from '@/composables/useCitySearch';
import { useErrorMessage } from '@/composables/useErrorMessage';
import { placeLabel } from '@/utils/place';
import InlineNotice from '@/components/InlineNotice.vue';

const open = defineModel<boolean>({ required: true });
const emit = defineEmits<{ pick: [place: Place]; locate: [] }>();

const { t, locale } = useI18n();
const errorMessage = useErrorMessage();
const { query, results, status, errorCode, retry, reset } = useCitySearch();

function onPick(place: Place) {
  emit('pick', place);
  open.value = false;
}

function onLocate() {
  emit('locate');
  open.value = false;
}
</script>

<template>
  <q-dialog
    v-model="open"
    :maximized="$q.screen.lt.sm"
    transition-show="fade"
    transition-hide="fade"
    @hide="reset"
  >
    <div class="sheet">
      <div class="bar">
        <q-input
          v-model="query"
          class="sheet-input"
          borderless
          dense
          autofocus
          clearable
          clear-icon="mdi-close-circle"
          debounce="300"
          :placeholder="t('search.placeholder')"
          @keyup.enter="results[0] && onPick(results[0])"
        >
          <template #prepend>
            <q-icon name="mdi-magnify" />
          </template>
        </q-input>
        <q-btn
          flat
          rounded
          no-caps
          :label="t('common.cancel')"
          @click="open = false"
        />
      </div>

      <div class="body">
        <button
          v-if="status === 'idle'"
          type="button"
          class="place"
          @click="onLocate"
        >
          <q-icon
            name="mdi-crosshairs-gps"
            size="22px"
            class="icon"
          />
          <span class="place-title">{{ t('search.useLocation') }}</span>
        </button>

        <div
          v-else-if="status === 'loading'"
          class="skeleton"
        >
          <q-skeleton
            v-for="n in 3"
            :key="n"
            type="rect"
            height="48px"
            animation="pulse"
          />
        </div>

        <ul
          v-else-if="status === 'done' && results.length"
          class="sheet-list"
        >
          <li
            v-for="p in results"
            :key="`${p.lat},${p.lon}`"
          >
            <button
              type="button"
              class="place"
              @click="onPick(p)"
            >
              <q-icon
                name="mdi-map-marker-outline"
                size="22px"
                class="icon"
              />
              <span class="place-text">
                <span class="place-title">
                  {{ placeLabel(p, locale).title }}
                </span>
                <span class="place-sub">
                  {{ placeLabel(p, locale).subtitle }}
                </span>
              </span>
            </button>
          </li>
        </ul>

        <InlineNotice
          v-else-if="status === 'done'"
          icon="mdi-map-search-outline"
          :text="t('search.noResults', { query: (query ?? '').trim() })"
          :hint="t('search.noResultsHint')"
        />

        <InlineNotice
          v-else
          icon="mdi-alert-circle-outline"
          :text="errorMessage(errorCode)"
          :action-label="t('common.retry')"
          @action="retry()"
        />
      </div>
    </div>
  </q-dialog>
</template>

<style scoped lang="scss">
.sheet {
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  background: var(--sheet);
  box-shadow: var(--shadow);
  color: var(--text);
}

.bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px 10px 20px;
  border-bottom: 1px solid var(--divider);
}

.sheet-input {
  flex: 1;
}

.body {
  flex: 1;
  min-height: 120px;
  overflow-y: auto;
  padding: 8px 0 16px;
}

.sheet-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 20px;
}

.place {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 20px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(--divider);
    outline: none;
  }
}

.icon {
  color: var(--text-muted);
}

.place-text {
  display: flex;
  flex-direction: column;
}

.place-title {
  font-size: 16px;
}

.place-sub {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
