<script setup lang="ts">
import { computed } from "vue";
import type { Condition } from "@/api/types";
import { getWeatherVisual, isDayIcon } from "@/utils/weatherVisual";

const props = withDefaults(
  defineProps<{ condition: Condition; size?: string }>(),
  {
    size: "32px",
  },
);

const visual = computed(() =>
  getWeatherVisual(props.condition.id, isDayIcon(props.condition.icon)),
);
</script>

<template>
  <q-icon
    :name="visual.icon"
    :size="size"
    :style="{ color: `var(--tone-${visual.tone})` }"
    aria-hidden="true"
  />
</template>
