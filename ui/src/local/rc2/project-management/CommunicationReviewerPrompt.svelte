<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isArbitor" boolean labelText="Satisfies arbitration skills?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
