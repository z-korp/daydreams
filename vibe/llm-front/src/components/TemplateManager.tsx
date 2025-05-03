import React, { useState, useEffect } from "react";
import "../styles/TemplateManager.css";

// Types pour les templates
interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: TemplateVariable[];
}

// URL de l'API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TemplateManager: React.FC = () => {
  // États
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [editing, setEditing] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // État du formulaire d'édition
  const [formState, setFormState] = useState<Template>({
    id: "",
    name: "",
    description: "",
    content: "",
    variables: [],
  });

  // Variables pour le rendu du template
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [renderedContent, setRenderedContent] = useState<string>("");

  // Charger tous les templates au démarrage
  useEffect(() => {
    loadTemplates();
  }, []);

  // Fonction pour charger tous les templates
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/templates`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setTemplates(data.templates || []);
      setError(null);
    } catch (err) {
      setError(`Failed to load templates: ${err}`);
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sélectionner un template
  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setVariableValues(
      template.variables.reduce(
        (acc, variable) => {
          acc[variable.name] = variable.defaultValue || "";
          return acc;
        },
        {} as Record<string, string>
      )
    );
    setRenderedContent("");
  };

  // Fonction pour rendre un template
  const renderTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(
        `${API_URL}/templates/${selectedTemplate.id}/render`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variables: variableValues,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setRenderedContent(data.rendered);
      } else {
        setError(data.error || "Failed to render template");
      }
    } catch (err) {
      setError(`Failed to render template: ${err}`);
      console.error("Error rendering template:", err);
    }
  };

  // Fonction pour commencer à éditer un template
  const startEditing = (template: Template) => {
    setFormState({ ...template });
    setEditing(true);
    setCreating(false);
  };

  // Fonction pour commencer à créer un nouveau template
  const startCreating = () => {
    setFormState({
      id: `template-${Date.now()}`,
      name: "",
      description: "",
      content: "",
      variables: [],
    });
    setEditing(false);
    setCreating(true);
  };

  // Fonction pour annuler l'édition ou la création
  const cancelEdit = () => {
    setEditing(false);
    setCreating(false);
  };

  // Fonction pour mettre à jour le formulaire
  const updateForm = (field: keyof Template, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Fonction pour ajouter une variable
  const addVariable = () => {
    setFormState((prev) => ({
      ...prev,
      variables: [
        ...prev.variables,
        { name: "", description: "", defaultValue: "" },
      ],
    }));
  };

  // Fonction pour mettre à jour une variable
  const updateVariable = (
    index: number,
    field: keyof TemplateVariable,
    value: string
  ) => {
    setFormState((prev) => {
      const variables = [...prev.variables];
      variables[index] = { ...variables[index], [field]: value };
      return { ...prev, variables };
    });
  };

  // Fonction pour supprimer une variable
  const deleteVariable = (index: number) => {
    setFormState((prev) => {
      const variables = prev.variables.filter((_, i) => i !== index);
      return { ...prev, variables };
    });
  };

  // Fonction pour sauvegarder les modifications
  const saveTemplate = async () => {
    try {
      const url = editing
        ? `${API_URL}/templates/${formState.id}`
        : `${API_URL}/templates`;

      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setEditing(false);
        setCreating(false);
        loadTemplates();
      } else {
        setError(data.error || "Failed to save template");
      }
    } catch (err) {
      setError(`Failed to save template: ${err}`);
      console.error("Error saving template:", err);
    }
  };

  // Fonction pour supprimer un template
  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(null);
        }
        loadTemplates();
      } else {
        setError(data.error || "Failed to delete template");
      }
    } catch (err) {
      setError(`Failed to delete template: ${err}`);
      console.error("Error deleting template:", err);
    }
  };

  // Création d'un agent avec le template
  const createAgent = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(
        `${API_URL}/daydreams/agents/with-template`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateId: selectedTemplate.id,
            variables: variableValues,
            modelType: "anthropic",
            modelId: "claude-3-7-sonnet-latest",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        alert(`Agent created successfully with ID: ${data.agentId}`);
      } else {
        setError(data.error || "Failed to create agent");
      }
    } catch (err) {
      setError(`Failed to create agent: ${err}`);
      console.error("Error creating agent:", err);
    }
  };

  // Affichage de l'interface
  return (
    <div className="template-manager">
      <h2>Template Manager</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="template-layout">
        <div className="template-list">
          <div className="template-list-header">
            <h3>Templates</h3>
            <button onClick={startCreating} className="create-button">
              New Template
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="no-templates">No templates available</div>
          ) : (
            <ul>
              {templates.map((template) => (
                <li
                  key={template.id}
                  className={
                    selectedTemplate?.id === template.id ? "selected" : ""
                  }
                  onClick={() => selectTemplate(template)}
                >
                  <div className="template-item-name">{template.name}</div>
                  <div className="template-item-description">
                    {template.description}
                  </div>
                  <div className="template-item-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(template);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(template.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(editing || creating) && (
          <div className="template-editor">
            <h3>{editing ? "Edit Template" : "Create Template"}</h3>
            <div className="form-group">
              <label>ID:</label>
              <input
                type="text"
                value={formState.id}
                onChange={(e) => updateForm("id", e.target.value)}
                disabled={editing}
              />
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => updateForm("name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                value={formState.description}
                onChange={(e) => updateForm("description", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Content:</label>
              <textarea
                value={formState.content}
                onChange={(e) => updateForm("content", e.target.value)}
                rows={10}
              />
            </div>

            <div className="variables-section">
              <div className="variables-header">
                <h4>Variables</h4>
                <button onClick={addVariable}>Add Variable</button>
              </div>

              {formState.variables.map((variable, index) => (
                <div key={index} className="variable-item">
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) =>
                        updateVariable(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <input
                      type="text"
                      value={variable.description}
                      onChange={(e) =>
                        updateVariable(index, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Default Value:</label>
                    <input
                      type="text"
                      value={variable.defaultValue || ""}
                      onChange={(e) =>
                        updateVariable(index, "defaultValue", e.target.value)
                      }
                    />
                  </div>
                  <button
                    className="delete-variable"
                    onClick={() => deleteVariable(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="editor-actions">
              <button onClick={saveTemplate} className="save-button">
                Save
              </button>
              <button onClick={cancelEdit} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedTemplate && !editing && !creating && (
          <div className="template-preview">
            <h3>Preview: {selectedTemplate.name}</h3>
            <p className="template-description">
              {selectedTemplate.description}
            </p>

            <div className="variables-input">
              <h4>Template Variables</h4>
              {selectedTemplate.variables.map((variable) => (
                <div key={variable.name} className="variable-input-item">
                  <label>{variable.name}:</label>
                  <div className="variable-input-group">
                    <input
                      type="text"
                      value={variableValues[variable.name] || ""}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          [variable.name]: e.target.value,
                        }))
                      }
                      placeholder={variable.description}
                    />
                    <div className="variable-description">
                      {variable.description}
                    </div>
                  </div>
                </div>
              ))}

              <div className="preview-actions">
                <button onClick={renderTemplate} className="render-button">
                  Render Template
                </button>
                <button onClick={createAgent} className="create-agent-button">
                  Create Agent with Template
                </button>
              </div>
            </div>

            {renderedContent && (
              <div className="rendered-content">
                <h4>Rendered Output</h4>
                <pre>{renderedContent}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
