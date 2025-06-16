import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectProps } from "@radix-ui/react-select";

function DurationDropdown(props: React.ComponentProps<React.FC<SelectProps>>) {
  return (
    <Select {...props}>
      <SelectTrigger className="h-10 w-full">
        <SelectValue placeholder="select expiry method" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5">5 minutes</SelectItem>
        <SelectItem value="30">30 minutes</SelectItem>
        <SelectItem value="60">1 hour</SelectItem>
        <SelectItem value="360">6 hours</SelectItem>
        <SelectItem value="720">12 hours</SelectItem>
        <SelectItem value="1440">24 hours</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default DurationDropdown;
