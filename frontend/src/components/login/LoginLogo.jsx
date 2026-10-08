import logo from "../../assets/loginlogo.png";
export default function LoginLogo() {
  return (
    <div className="mb-6 flex justify-center">
      <img
        src={logo}
        alt="GIS Metadata Generator"
        className="h-20 w-auto object-contain"
      />
    </div>
  );
}