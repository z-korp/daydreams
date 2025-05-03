import { Injectable } from "@nestjs/common";

export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: TemplateVariable[];
}

@Injectable()
export class TemplateService {
  private templates: Map<string, Template> = new Map();

  constructor() {
    // Initialiser avec quelques templates par défaut
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates() {
    const chatTemplate: Template = {
      id: "basic-chat",
      name: "Assistant de chat basique",
      description: "Un template simple pour un assistant conversationnel",
      content: `
You are a helpful AI assistant named {{botName}}. Your goal is to help users with their questions and tasks.

<context>
{{context}}
</context>

You should always be:
- Polite and respectful
- Clear and concise
- Helpful within the scope of your abilities
- Honest about your limitations

When responding, follow these guidelines:
1. Address the user by name if provided
2. Consider the context of the conversation
3. Ask clarifying questions when needed
4. Provide accurate information based on your knowledge
5. Suggest follow-up actions when appropriate

User: {{userInput}}
{{botName}}:`,
      variables: [
        {
          name: "botName",
          description: "Le nom de l'assistant",
          defaultValue: "Assistant",
        },
        {
          name: "context",
          description: "Contexte supplémentaire pour l'assistant",
          defaultValue:
            "Vous êtes en train d'avoir une conversation avec un utilisateur.",
        },
        {
          name: "userInput",
          description: "La requête de l'utilisateur",
          defaultValue: "",
        },
      ],
    };

    const techSupportTemplate: Template = {
      id: "tech-support",
      name: "Assistant de support technique",
      description: "Un template pour un assistant de support technique",
      content: `
You are a technical support specialist for {{companyName}}. Your job is to help users troubleshoot and solve technical problems related to {{productName}}.

<technical-knowledge>
{{technicalDetails}}
</technical-knowledge>

Follow this process for technical support:
1. Greet the user and acknowledge their issue
2. Ask for any missing information needed to diagnose the problem
3. Suggest the most likely solutions first, starting with the simplest
4. Provide step-by-step instructions for implementing solutions
5. Verify if the solution worked and suggest alternatives if needed
6. Close with an offer for additional help if the issue persists

User Issue: {{userIssue}}
Support Agent:`,
      variables: [
        {
          name: "companyName",
          description: "Le nom de l'entreprise",
          defaultValue: "TechCorp",
        },
        {
          name: "productName",
          description: "Le nom du produit concerné",
          defaultValue: "ProductX",
        },
        {
          name: "technicalDetails",
          description: "Détails techniques sur le produit",
          defaultValue:
            "Informations techniques sur le produit et les solutions courantes.",
        },
        {
          name: "userIssue",
          description: "La description du problème par l'utilisateur",
          defaultValue: "",
        },
      ],
    };

    this.templates.set(chatTemplate.id, chatTemplate);
    this.templates.set(techSupportTemplate.id, techSupportTemplate);
  }

  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  getTemplateById(id: string): Template | null {
    return this.templates.get(id) || null;
  }

  createTemplate(template: Template): string {
    this.templates.set(template.id, template);
    return template.id;
  }

  updateTemplate(id: string, template: Partial<Template>): boolean {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) {
      return false;
    }

    this.templates.set(id, {
      ...existingTemplate,
      ...template,
      id, // Assurons-nous que l'ID ne change pas
    });

    return true;
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  renderTemplate(id: string, variables: Record<string, string>): string | null {
    const template = this.templates.get(id);
    if (!template) {
      return null;
    }

    // Combines default values with provided variables
    const allVariables = template.variables.reduce(
      (acc, variable) => {
        acc[variable.name] =
          variables[variable.name] || variable.defaultValue || "";
        return acc;
      },
      {} as Record<string, string>
    );

    // Simple template rendering with variable substitution
    let renderedContent = template.content;
    Object.entries(allVariables).forEach(([key, value]) => {
      renderedContent = renderedContent.replace(
        new RegExp(`{{${key}}}`, "g"),
        value
      );
    });

    return renderedContent;
  }
}
