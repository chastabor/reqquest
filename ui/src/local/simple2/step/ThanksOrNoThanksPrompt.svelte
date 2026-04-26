<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="thanks" boolean legendText="Would you like to see if you are eligible for this program?" items={[{ label: "Thanks", value: true }, { label: "No Thanks", value: false }]} />
