<script setup lang="ts">
defineProps<{
  icon: string;
  text: string;
  hint?: string;
  actionLabel?: string;
}>();

const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <q-banner rounded class="notice" role="status">
    <template #avatar>
      <q-icon :name="icon" size="22px" class="icon" />
    </template>

    <div class="text">{{ text }}</div>
    <div v-if="hint" class="hint">{{ hint }}</div>

    <template v-if="actionLabel" #action>
      <q-btn
        flat
        dense
        rounded
        no-caps
        :label="actionLabel"
        @click="emit('action')"
      />
    </template>
  </q-banner>
</template>

<style scoped lang="scss">
.notice {
  margin: 8px 16px;
  border: 1px solid var(--surface-border);
  background: var(--sheet);
  color: var(--text);

  .icon {
    color: var(--text-muted);
  }

  .hint {
    margin-top: 2px;
    font-size: 13px;
    color: var(--text-muted);
  }
}
</style>
