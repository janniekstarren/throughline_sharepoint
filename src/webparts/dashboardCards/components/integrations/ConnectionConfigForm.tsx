// ============================================
// ConnectionConfigForm — Dynamic form for platform configuration
// Renders configFields from PlatformRegistration
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Input,
  Select,
  Switch,
  Label,
  Text,
  Button,
} from '@fluentui/react-components';
import { PlugConnected20Regular } from '@fluentui/react-icons';
import { ConfigField, PlatformRegistration } from '../../models/Integration';

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
  helpText: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
});

interface ConnectionConfigFormProps {
  platform: PlatformRegistration;
  onConnect: (configValues: Record<string, string>) => void;
  onCancel: () => void;
  isConnecting?: boolean;
}

export const ConnectionConfigForm: React.FC<ConnectionConfigFormProps> = ({
  platform,
  onConnect,
  onCancel,
  isConnecting = false,
}) => {
  const classes = useStyles();
  const [values, setValues] = React.useState<Record<string, string>>({});

  const handleChange = React.useCallback((fieldId: string, value: string) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleSubmit = React.useCallback(() => {
    onConnect(values);
  }, [values, onConnect]);

  const isValid = React.useMemo(() => {
    if (!platform.configFields?.length) return true;
    return platform.configFields
      .filter(f => f.required)
      .every(f => values[f.id]?.trim());
  }, [platform.configFields, values]);

  const renderField = (field: ConfigField): React.ReactElement => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            value={values[field.id] || ''}
            onChange={(_e, data) => handleChange(field.id, data.value)}
          >
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.text}</option>
            ))}
          </Select>
        );
      case 'toggle':
        return (
          <Switch
            checked={values[field.id] === 'true'}
            onChange={(_e, data) => handleChange(field.id, data.checked ? 'true' : 'false')}
          />
        );
      case 'password':
        return (
          <Input
            type="password"
            placeholder={field.placeholder}
            value={values[field.id] || ''}
            onChange={(_e, data) => handleChange(field.id, data.value)}
          />
        );
      case 'url':
        return (
          <Input
            type="url"
            placeholder={field.placeholder}
            value={values[field.id] || ''}
            onChange={(_e, data) => handleChange(field.id, data.value)}
          />
        );
      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={values[field.id] || ''}
            onChange={(_e, data) => handleChange(field.id, data.value)}
          />
        );
    }
  };

  return (
    <div className={classes.form}>
      {platform.configFields?.map(field => (
        <div key={field.id} className={classes.field}>
          <Label required={field.required}>{field.label}</Label>
          {renderField(field)}
          {field.helpText && (
            <Text className={classes.helpText}>{field.helpText}</Text>
          )}
        </div>
      ))}

      {!platform.configFields?.length && (
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
          No configuration required — click Connect to proceed with OAuth.
        </Text>
      )}

      <div className={classes.actions}>
        <Button
          appearance="primary"
          icon={<PlugConnected20Regular />}
          onClick={handleSubmit}
          disabled={!isValid || isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
        <Button appearance="subtle" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
