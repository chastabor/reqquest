<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
  export let gatheredConfigData: any
</script>

<FieldRadio path="residentOfRequiredState" boolean legendText={`Confirm applicant is a resident of ${gatheredConfigData.residentOfState}?`} items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
<FieldRadio path="residenceIsHome" boolean legendText={`Confirm applicant address provided is a home within ${gatheredConfigData.residentOfState}?`} items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
