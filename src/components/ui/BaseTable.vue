<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
  selectedKey: { type: [String, Number], default: null },
  clickable: { type: Boolean, default: false },
  caption: { type: String, default: '' },
})

const emit = defineEmits(['row-click'])
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <caption v-if="caption" class="sr-only">
        {{
          caption
        }}
      </caption>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :class="{ nowrap: col.nowrap }"
            :style="{ width: col.width, textAlign: col.align ?? 'left' }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row[rowKey]"
          :class="{
            'is-selected': selectedKey != null && String(row[rowKey]) === String(selectedKey),
            'is-clickable': clickable,
          }"
          @click="clickable && emit('row-click', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="{ nowrap: col.nowrap }"
            :style="{ textAlign: col.align ?? 'left' }"
          >
            <slot :name="`cell-${col.key}`" :row="row">{{ row[col.key] }}</slot>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="table__empty">
            <slot name="empty">Sin registros.</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-base);
}

th {
  padding: var(--space-4) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-title-accent);
  background: var(--color-table-head);
  vertical-align: middle;
}

th:first-child {
  border-top-left-radius: var(--radius-sm);
}

th:last-child {
  border-top-right-radius: var(--radius-sm);
}

td {
  padding: 13px var(--space-3);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  vertical-align: middle;
}

.nowrap {
  white-space: nowrap;
}

tr.is-clickable {
  cursor: pointer;
}

tbody tr.is-clickable:hover {
  background: var(--color-row-hover);
}

tbody tr.is-selected,
tbody tr.is-selected:hover {
  background: var(--color-row-selected);
}

.table__empty {
  padding: var(--space-8) var(--space-3);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
