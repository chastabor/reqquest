<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="acknowledged" boolean legendText="Applicant acknowledges participation expectations." items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
