<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { Button as ButtonPrimitive } from "bits-ui";
  import { buttonVariants } from "./index.js";
  import type { Events, Props } from "./index.js";

  type $$Props = Props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type $$Events = Events;

  let className: $$Props["class"] = undefined;
  export let variant: $$Props["variant"] = "default";
  export let size: $$Props["size"] = "default";
  export let builders: $$Props["builders"] = [];
  export { className as class };
</script>

<ButtonPrimitive.Root
  {builders}
  class={cn(buttonVariants({ variant, size, className }))}
  type="button"
  {...$$restProps}
  on:click
  on:keydown
>
  <slot />
</ButtonPrimitive.Root>
