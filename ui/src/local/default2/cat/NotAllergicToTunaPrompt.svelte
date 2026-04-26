<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="allergicToTuna" boolean legendText="Are you allergic to airborne tuna?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
