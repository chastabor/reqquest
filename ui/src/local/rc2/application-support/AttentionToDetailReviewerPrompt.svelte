<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isDetailed" boolean labelText="Applicant demonstrate attention to detail?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
