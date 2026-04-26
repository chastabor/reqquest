<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="allow" boolean legendText="Should we allow the flow to continue?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
