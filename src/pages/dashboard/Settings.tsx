import { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { 
  Store, ImageIcon, Type, MessageSquare, Palette, DollarSign, 
  FileText, Columns, Bell, Trash2, Upload, Save, Loader2, Check, AlertCircle 
} from 'lucide-react';
import { PAPER_SIZES, AUTO_DELETE_OPTIONS } from '@/utils/constants';
import type { PaperSize } from '@/types/order';
import type { UpdateSettingsPayload } from '@/types/settings';
import { uploadLogo } from '@/services/settings.service';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [formData, setFormData] = useState<Partial<UpdateSettingsPayload>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        shop_name: settings.shop_name,
        welcome_message: settings.welcome_message,
        theme_color: settings.theme_color,
        pricing_enabled: settings.pricing_enabled,
        bw_price: settings.bw_price,
        color_price: settings.color_price,
        paper_sizes: settings.paper_sizes,
        allow_double_side: settings.allow_double_side,
        notification_enabled: settings.notification_enabled,
        auto_delete_hours: settings.auto_delete_hours,
        logo_url: settings.logo_url
      });
      setLogoPreview(settings.logo_url || null);
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = (key: keyof UpdateSettingsPayload, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handlePaperSizeToggle = (size: PaperSize) => {
    const current = formData.paper_sizes || [];
    const updated = current.includes(size)
      ? current.filter(s => s !== size)
      : [...current, size];
    handleChange('paper_sizes', updated);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const url = await uploadLogo(file);
      handleChange('logo_url', url);
      setLogoPreview(url);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    handleChange('logo_url', null);
    setLogoPreview(null);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      setIsSaving(true);
      await updateSettings(formData as UpdateSettingsPayload);
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="p-6 max-w-4xl mx-auto w-full animate-pulse space-y-6">
        <div className="h-8 bg-white/10 rounded w-48 mb-8"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl">
            <div className="h-6 bg-white/10 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-white/5 rounded w-full"></div>
              <div className="h-10 bg-white/5 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full pb-24 text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Shop Settings</h1>
          <p className="text-white/60 text-sm mt-1">Configure your print shop preferences</p>
        </div>
        {hasChanges && (
          <div className="flex items-center text-indigo-400 text-sm font-medium">
            <AlertCircle className="w-4 h-4 mr-1" />
            Unsaved changes
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Shop Identity */}
        <section className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Shop Identity</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <ImageIcon className="w-4 h-4 text-white/50" /> Logo
              </label>
              <div className="flex items-start gap-6 relative">
                <div 
                  className={`w-32 h-32 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center transition-colors relative overflow-hidden group bg-white/5 hover:bg-white/10 cursor-pointer`}
                  onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
                >
                  {isUploadingLogo ? (
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  ) : logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-white/50 mb-2" />
                      <span className="text-xs text-white/50">Upload Logo</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                  />
                </div>
                {logoPreview && (
                  <button 
                    onClick={handleRemoveLogo}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium mt-2"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2" htmlFor="shop_name">
                <Type className="w-4 h-4 text-white/50" /> Shop Name
              </label>
              <input 
                id="shop_name"
                type="text" 
                value={formData.shop_name || ''} 
                onChange={e => handleChange('shop_name', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white placeholder-white/30"
                placeholder="My Print Shop"
              />
            </div>

            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2" htmlFor="welcome_message">
                <MessageSquare className="w-4 h-4 text-white/50" /> Welcome Message
              </label>
              <textarea 
                id="welcome_message"
                value={formData.welcome_message || ''} 
                onChange={e => handleChange('welcome_message', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[100px] resize-y text-white placeholder-white/30"
                placeholder="Welcome to our print shop! Upload your files here."
              />
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Theme</h2>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="theme_color">Theme Color</label>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl border border-white/10 overflow-hidden shadow-sm">
                <input 
                  id="theme_color"
                  type="color" 
                  value={formData.theme_color || '#6366f1'} 
                  onChange={e => handleChange('theme_color', e.target.value)}
                  className="absolute inset-0 w-16 h-16 -top-2 -left-2 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-xl bg-white/5">
                <span className="text-white/70 font-mono text-sm">{formData.theme_color?.toUpperCase() || '#6366F1'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Pricing</h2>
            </div>
            <label className={`relative inline-flex items-center cursor-pointer`} htmlFor="pricing_enabled">
              <input 
                id="pricing_enabled"
                type="checkbox" 
                className="sr-only peer"
                checked={formData.pricing_enabled || false}
                onChange={e => handleChange('pricing_enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>
            </label>
          </div>
          
          {formData.pricing_enabled && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="bw_price">B&W Price per Page</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-white/50 sm:text-sm">₹</span>
                  </div>
                  <input 
                    id="bw_price"
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.bw_price || 0} 
                    onChange={e => handleChange('bw_price', parseFloat(e.target.value))}
                    className="w-full pl-7 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="color_price">Color Price per Page</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-white/50 sm:text-sm">₹</span>
                  </div>
                  <input 
                    id="color_price"
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.color_price || 0} 
                    onChange={e => handleChange('color_price', parseFloat(e.target.value))}
                    className="w-full pl-7 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Print Options */}
        <section className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Print Options</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">Available Paper Sizes</label>
              <div className="flex flex-wrap gap-4">
                {PAPER_SIZES.map(ps => (
                  <label key={ps.value} className="flex items-center gap-2 cursor-pointer" htmlFor={`paper_size_${ps.value}`}>
                    <input 
                      id={`paper_size_${ps.value}`}
                      type="checkbox" 
                      className="w-4 h-4 text-indigo-500 rounded border-white/20 bg-white/5 focus:ring-indigo-500 focus:ring-offset-gray-900"
                      checked={formData.paper_sizes?.includes(ps.value) || false}
                      onChange={() => handlePaperSizeToggle(ps.value)}
                    />
                    <span className="text-white/80">{ps.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Columns className="w-4 h-4 text-white/50" /> Allow Double Sided Printing
                </div>
                <p className="text-xs text-white/50 mt-1">Let users choose double-sided print options</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer" htmlFor="allow_double_side">
                <input 
                  id="allow_double_side"
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.allow_double_side || false}
                  onChange={e => handleChange('allow_double_side', e.target.checked)}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Notifications & Auto Delete */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white/80">Notification Sound</div>
                  <p className="text-xs text-white/50 mt-1">Play sound on new orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer" htmlFor="notification_enabled">
                  <input 
                    id="notification_enabled"
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.notification_enabled || false}
                    onChange={e => handleChange('notification_enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>
                </label>
              </div>
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Auto-Delete Files</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {AUTO_DELETE_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer" htmlFor={`auto_delete_${option.value}`}>
                    <div className="relative flex items-center justify-center">
                      <input 
                        id={`auto_delete_${option.value}`}
                        type="radio" 
                        name="auto_delete"
                        className="peer sr-only"
                        checked={formData.auto_delete_hours === option.value}
                        onChange={() => handleChange('auto_delete_hours', option.value)}
                      />
                      <div className="w-4 h-4 rounded-full border border-white/30 peer-checked:border-indigo-500 flex items-center justify-center bg-white/5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                    <span className="text-sm text-white/80">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4 mt-8 bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-2xl z-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50 font-medium">
            {hasChanges ? 'You have unsaved changes' : 'All settings saved'}
          </span>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all ${
              !hasChanges || isSaving 
                ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : hasChanges ? (
              <Save className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
