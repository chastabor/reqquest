<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isOrchestrated" boolean labelText="Satisfies organization/coordination of tasks?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
