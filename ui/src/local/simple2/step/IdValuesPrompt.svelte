<script lang="ts">
  import { FieldRadio, FieldTextInput } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="type" string legendText="Are you inputing DODId or SSN?" items={[{ label: "DODId", value: "dodid" }, { label: "SSN", value: "ssn" }]} />
<FieldTextInput path="dodidValue" labelText="Department of Defense id" conditional={data.type === 'dodid'} />
<FieldTextInput path="ssnValue" labelText="Social security number" conditional={data.type === 'ssn'} />
