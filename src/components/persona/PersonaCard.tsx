import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Smartphone, 
  Clock,
  Target,
  Trash2,
  Edit
} from "lucide-react";
import type { CustomerPersona } from "@/hooks/useCustomerPersonas";

interface PersonaCardProps {
  persona: CustomerPersona;
  genderName?: string;
  onEdit: (persona: CustomerPersona) => void;
  onDelete: (personaId: string) => void;
}

export function PersonaCard({ persona, genderName, onEdit, onDelete }: PersonaCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={persona.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {persona.persona_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{persona.persona_name}</CardTitle>
              {persona.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {persona.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(persona)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(persona.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demographics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {genderName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{genderName}</span>
            </div>
          )}
          {(persona.age_min || persona.age_max) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>
                {persona.age_min && persona.age_max 
                  ? `${persona.age_min}-${persona.age_max} ปี`
                  : persona.age_min 
                    ? `${persona.age_min}+ ปี`
                    : `ไม่เกิน ${persona.age_max} ปี`
                }
              </span>
            </div>
          )}
        </div>

        {/* Professional */}
        <div className="space-y-2">
          {persona.profession && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{persona.profession}</span>
              {persona.industry && (
                <Badge variant="secondary" className="text-xs">
                  {persona.industry}
                </Badge>
              )}
            </div>
          )}
          {persona.salary_range && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{persona.salary_range}</span>
            </div>
          )}
        </div>

        {/* Behavioral */}
        <div className="space-y-2">
          {persona.preferred_devices && persona.preferred_devices.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              {persona.preferred_devices.map((device) => (
                <Badge key={device} variant="outline" className="text-xs capitalize">
                  {device}
                </Badge>
              ))}
            </div>
          )}
          {persona.active_hours && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{persona.active_hours}</span>
            </div>
          )}
        </div>

        {/* Interests */}
        {persona.interests && persona.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {persona.interests.slice(0, 5).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {persona.interests.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{persona.interests.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
