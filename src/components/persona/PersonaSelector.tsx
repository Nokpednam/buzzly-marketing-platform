import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerPersonas } from "@/hooks/useCustomerPersonas";

interface PersonaSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  teamId: string;
  disabled?: boolean;
  placeholder?: string;
}

export const PersonaSelector = ({
  selectedIds,
  onChange,
  teamId,
  disabled,
  placeholder = "เลือก Persona...",
}: PersonaSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { personas, isLoading } = useCustomerPersonas(teamId);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  };

  const selectedPersonas = (personas ?? []).filter((p) => selectedIds.includes(p.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-[2.25rem] h-auto"
          disabled={disabled || isLoading}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selectedPersonas.length > 0 ? (
              selectedPersonas.map((p) => (
                <Badge key={p.id} variant="secondary" className="text-xs font-normal">
                  {p.persona_name}
                  {p.is_template && (
                    <span className="ml-1 text-[9px] opacity-50 uppercase tracking-wide">
                      tmpl
                    </span>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหา Persona..." />
          <CommandList>
            <CommandEmpty>ไม่พบ Persona</CommandEmpty>
            <CommandGroup>
              {(personas ?? []).map((persona) => (
                <CommandItem
                  key={persona.id}
                  value={persona.persona_name}
                  onSelect={() => toggle(persona.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      selectedIds.includes(persona.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {persona.avatar_url ? (
                      <img
                        src={persona.avatar_url}
                        alt=""
                        className="h-5 w-5 rounded-full shrink-0 object-cover"
                      />
                    ) : (
                      <UserCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{persona.persona_name}</span>
                    {persona.is_template && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-4 shrink-0 ml-auto"
                      >
                        Template
                      </Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
