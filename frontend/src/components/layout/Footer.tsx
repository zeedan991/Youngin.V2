export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <span className="text-white font-[900] text-xl tracking-[4px]">
            YOUNGIN
          </span>
          <p className="text-[#888888] text-sm mt-4 max-w-xs">
            The billion-dollar ecosystem for the next generation of fashion.
            Design, fit, and wear.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-[#00E5FF]">
            Product
          </h4>
          <ul className="space-y-3 text-[#888888] text-sm">
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                3D Studio
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                AI Measurements
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Brand Marketplace
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Tailor Network
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-[#00E5FF]">
            Community
          </h4>
          <ul className="space-y-3 text-[#888888] text-sm">
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Thrift Box
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Creators
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Discord
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Blog
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-[#00E5FF]">
            Company
          </h4>
          <ul className="space-y-3 text-[#888888] text-sm">
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Careers
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Legal
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white hover:text-glow transition-all"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-[#555555]">
        <p>© 2026 YOUNGIN Inc. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};
