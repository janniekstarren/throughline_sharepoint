// ============================================
// RequestIntegrationForm — User can request a new integration
// Stores in localStorage (POC)
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Input,
  Textarea,
  Select,
  Label,
  Button,
  Text,
} from '@fluentui/react-components';
import { Send20Regular, ArrowLeft20Regular } from '@fluentui/react-icons';
import { IntegrationCategoryMeta } from '../../models/Integration';

const STORAGE_KEY = 'throughline-integration-requests';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
  success: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorPaletteGreenBackground1,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'center',
  },
});

interface RequestIntegrationFormProps {
  onBack: () => void;
}

export const RequestIntegrationForm: React.FC<RequestIntegrationFormProps> = ({ onBack }) => {
  const classes = useStyles();
  const [platformName, setPlatformName] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = React.useCallback(() => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.push({
        platformName,
        category,
        description,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // Ignore storage errors
    }
    setSubmitted(true);
  }, [platformName, category, description]);

  const isValid = platformName.trim().length > 0;

  if (submitted) {
    return (
      <div className={classes.form}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={onBack}
        >
          Back to integrations
        </Button>
        <div className={classes.success}>
          <Text weight="semibold" size={300}>
            Request submitted for {platformName}
          </Text>
          <br />
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            We will notify you when this integration is available.
          </Text>
        </div>
      </div>
    );
  }

  const categories = Object.values(IntegrationCategoryMeta)
    .filter(c => !c.isBuiltIn)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className={classes.form}>
      <Button
        appearance="subtle"
        icon={<ArrowLeft20Regular />}
        onClick={onBack}
      >
        Back to integrations
      </Button>

      <Text weight="semibold" size={400}>Request an Integration</Text>
      <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
        Tell us which platform you would like to connect to Throughline.
      </Text>

      <div className={classes.field}>
        <Label required>Platform name</Label>
        <Input
          placeholder="e.g. Asana, GitHub, Notion..."
          value={platformName}
          onChange={(_e, data) => setPlatformName(data.value)}
        />
      </div>

      <div className={classes.field}>
        <Label>Category</Label>
        <Select value={category} onChange={(_e, data) => setCategory(data.value)}>
          <option value="">Select a category...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.displayName}</option>
          ))}
        </Select>
      </div>

      <div className={classes.field}>
        <Label>How would you use this integration?</Label>
        <Textarea
          placeholder="Describe the signals or cards you would expect..."
          value={description}
          onChange={(_e, data) => setDescription(data.value)}
          rows={3}
        />
      </div>

      <div className={classes.actions}>
        <Button
          appearance="primary"
          icon={<Send20Regular />}
          onClick={handleSubmit}
          disabled={!isValid}
        >
          Submit Request
        </Button>
        <Button appearance="subtle" onClick={onBack}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
