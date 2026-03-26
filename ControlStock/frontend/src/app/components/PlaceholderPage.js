export function PlaceholderPage({
  title,
  description,
  icon: Icon
}) {
  return <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500">{description}</p>
        <div className="mt-8">
          <p className="text-sm text-gray-400">Esta sección estará disponible próximamente</p>
        </div>
      </div>
    </div>;
}