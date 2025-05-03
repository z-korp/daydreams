import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { TemplateService, Template } from "./template.service.js";

// DTO pour la création et la mise à jour de templates
export class TemplateDto implements Omit<Template, "variables"> {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: Array<{
    name: string;
    description: string;
    defaultValue?: string;
  }>;
}

// DTO pour le rendu d'un template
export class RenderTemplateDto {
  variables: Record<string, string>;
}

@Controller("templates")
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  getAllTemplates() {
    return {
      templates: this.templateService.getAllTemplates(),
    };
  }

  @Get(":id")
  getTemplateById(@Param("id") id: string) {
    const template = this.templateService.getTemplateById(id);
    if (!template) {
      return { error: `Template ${id} not found` };
    }
    return { template };
  }

  @Post()
  createTemplate(@Body() templateDto: TemplateDto) {
    try {
      const templateId = this.templateService.createTemplate(templateDto);
      return {
        success: true,
        templateId,
        message: `Template ${templateId} created successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create template",
      };
    }
  }

  @Put(":id")
  updateTemplate(
    @Param("id") id: string,
    @Body() templateDto: Partial<TemplateDto>
  ) {
    const success = this.templateService.updateTemplate(id, templateDto);
    if (success) {
      return {
        success: true,
        message: `Template ${id} updated successfully`,
      };
    }
    return {
      success: false,
      error: `Template ${id} not found`,
    };
  }

  @Delete(":id")
  deleteTemplate(@Param("id") id: string) {
    const success = this.templateService.deleteTemplate(id);
    if (success) {
      return {
        success: true,
        message: `Template ${id} deleted successfully`,
      };
    }
    return {
      success: false,
      error: `Template ${id} not found`,
    };
  }

  @Post(":id/render")
  renderTemplate(
    @Param("id") id: string,
    @Body() renderDto: RenderTemplateDto
  ) {
    const rendered = this.templateService.renderTemplate(
      id,
      renderDto.variables
    );
    if (rendered) {
      return {
        success: true,
        rendered,
      };
    }
    return {
      success: false,
      error: `Template ${id} not found`,
    };
  }
}
